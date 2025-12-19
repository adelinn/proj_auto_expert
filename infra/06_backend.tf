locals {
  cloud_run_envs = {
    CLIENT_ORIGIN = "http://localhost:5173"

    DB_HOST = "/cloudsql/${google_sql_database_instance.main.connection_name}"
    DB_PORT = "3306"
    DB_USER = google_sql_user.db_admin.name
    DB_NAME = google_sql_database.database.name

    # SSL mode is disabled here because the Cloud SQL instance is configured to require SSL and we use the Cloud Run - Cloud SQL integration
    # which creates a secure tunnel to the Cloud SQL instance. Read more here https://cloud.google.com/sql/docs/postgres/configure-ssl-instance#enforcing-ssl
    DB_SSL = "false"

    LOG_LEVEL = "trace"
  }
  cloud_run_secrets = {
    DB_PASSWORD = google_secret_manager_secret_version.db_admin_password
    JWT_SECRET  = google_secret_manager_secret_version.jwt_secret
  }
}

locals {
  cloud_run_name = "backend-prod"
}

resource "google_cloud_run_v2_service" "main" {
  name     = local.cloud_run_name
  location = local.props.gcp.location
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloud_run_agent.email

    containers {
      image = "us-docker.pkg.dev/cloudrun/container/placeholder"

      dynamic "env" {
        for_each = local.cloud_run_envs

        content {
          name  = env.key
          value = env.value
        }
      }

      dynamic "env" {
        for_each = local.cloud_run_secrets

        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = env.value.secret
              version = env.value.version
            }
          }
        }
      }

      resources {
        limits = {
          "cpu"    = "1"
          "memory" = "1Gi"
        }
        cpu_idle          = false
        startup_cpu_boost = true
      }

      startup_probe {
        initial_delay_seconds = 0
        failure_threshold     = 1
        period_seconds        = 240
        timeout_seconds       = 240

        tcp_socket {}
      }

      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 5
    }

    timeout = "600s"

    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [google_sql_database_instance.main.connection_name]
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  lifecycle {
    ignore_changes = [
      scaling,
      template[0].containers[0].image,
      template[0].containers[0].name,
      template[0].labels,
      labels,
      client,
      client_version
    ]
  }

  depends_on = [google_project_service.main["run.googleapis.com"]]
}

# Allow public access to the API
resource "google_cloud_run_v2_service_iam_binding" "main" {
  location = google_cloud_run_v2_service.main.location
  name     = google_cloud_run_v2_service.main.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}

### Service Account
resource "google_service_account" "cloud_run_agent" {
  account_id  = "sa-${local.cloud_run_name}"
  description = "Service Account used by ${local.cloud_run_name} Cloud Run instance"
}

resource "google_project_iam_member" "cloud_run_permisions" {
  for_each = toset([
    "roles/cloudsql.client",
    "roles/cloudsql.instanceUser",
    "roles/cloudtrace.agent",
    "roles/secretmanager.secretAccessor"
  ])
  project = data.google_project.main.project_id
  role    = each.key
  member  = google_service_account.cloud_run_agent.member
}

locals {
  jwt_secret_version = 1
}

ephemeral "random_password" "jwt_secret" {
  length  = 32
  special = true
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret-prod"
  replication {
    auto {}
  }

  depends_on = [google_project_service.main["secretmanager.googleapis.com"]]
}

resource "google_secret_manager_secret_version" "jwt_secret" {
  secret                 = google_secret_manager_secret.jwt_secret.id
  secret_data_wo         = ephemeral.random_password.jwt_secret.result
  secret_data_wo_version = local.jwt_secret_version
}

resource "github_actions_variable" "cloudrun_sa_email" {
  repository    = local.repo_name
  variable_name = "GCP_CLOUDRUN_SA_EMAIL"
  value         = google_service_account.cloud_run_agent.email
}
