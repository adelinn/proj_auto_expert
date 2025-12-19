resource "google_artifact_registry_repository" "main" {
  repository_id = "ar-main-prod"
  format        = "DOCKER"
  description   = "Container registry for production environment"
  location      = local.props.gcp.location

  cleanup_policies {
    id     = "keep-most-recent"
    action = "KEEP"
    most_recent_versions {
      keep_count = 10
    }
  }
  cleanup_policies {
    id     = "delete-old"
    action = "DELETE"
    condition {
      older_than = "30d"
    }
  }

  depends_on = [google_project_service.main["artifactregistry.googleapis.com"]]
}

resource "github_actions_variable" "gcp_ar_baseurl" {
  repository    = local.repo_name
  variable_name = "GCP_AR_BASEURL"
  value         = google_artifact_registry_repository.main.registry_uri
}
