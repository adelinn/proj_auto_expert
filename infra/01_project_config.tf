# Enables required APIs.
resource "google_project_service" "main" {
  provider = google-beta.no_user_project_override
  project  = data.google_project.main.project_id
  for_each = toset([
    "cloudbilling.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "firebase.googleapis.com",
    "firebasehosting.googleapis.com",
    "dns.googleapis.com",
    # Enabling the ServiceUsage API allows the new project to be quota checked from now on.
    "serviceusage.googleapis.com",
    "secretmanager.googleapis.com",
    "sqladmin.googleapis.com",
    "artifactregistry.googleapis.com",
    "run.googleapis.com",
  ])
  service = each.key

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}

# Enables Firebase services for the new project created above.
resource "google_firebase_project" "main" {
  provider = google-beta
  project  = data.google_project.main.project_id

  # Waits for the required APIs to be enabled.
  depends_on = [
    google_project_service.main
  ]
}

resource "github_actions_variable" "gcp_project_id" {
  repository    = local.repo_name
  variable_name = "GCP_PROJECT_ID"
  value         = data.google_project.main.project_id
}

resource "github_actions_variable" "gcp_region" {
  repository    = local.repo_name
  variable_name = "GCP_REGION"
  value         = local.props.gcp.location
}
