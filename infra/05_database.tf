resource "google_sql_database" "database" {
  name     = "auto_expert"
  instance = google_sql_database_instance.main.name
}

# See versions at https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/sql_database_instance#database_version
resource "google_sql_database_instance" "main" {
  name             = "auto-expert-db"
  database_version = "MYSQL_8_4"
  settings {
    tier    = "db-f1-micro"
    edition = "ENTERPRISE"
  }

  deletion_protection = true

  depends_on = [google_project_service.main["sqladmin.googleapis.com"]]
}

ephemeral "random_password" "db_admin" {
  length  = 32
  special = false
}

resource "google_sql_user" "db_admin" {
  instance            = google_sql_database_instance.main.id
  name                = "db_admin"
  password_wo         = ephemeral.random_password.db_admin.result
  password_wo_version = 1
}

resource "google_secret_manager_secret" "db_admin_password" {
  secret_id = "db-admin-password-prod"
  replication {
    auto {}
  }

  depends_on = [google_project_service.main["secretmanager.googleapis.com"]]
}

resource "google_secret_manager_secret_version" "db_admin_password" {
  secret                 = google_secret_manager_secret.db_admin_password.id
  secret_data_wo         = ephemeral.random_password.db_admin.result
  secret_data_wo_version = 1
}
