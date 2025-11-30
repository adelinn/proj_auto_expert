resource "google_firebase_hosting_site" "main" {
  provider = google-beta
  site_id  = "auto-expert-quiz"

  depends_on = [google_project_service.main, google_firebase_project.main]
}

resource "github_actions_variable" "firebase_hosting_site_id" {
  repository    = local.repo_name
  variable_name = "FIREBASE_HOSTING_SITE_ID"
  value         = google_firebase_hosting_site.main.site_id
}

resource "google_firebase_hosting_custom_domain" "main" {
  provider      = google-beta
  site_id       = google_firebase_hosting_site.main.site_id
  custom_domain = local.app_domain

  wait_dns_verification = false
}

resource "google_firebase_hosting_version" "main" {
  provider = google-beta
  site_id  = google_firebase_hosting_site.main.site_id
  config {
    rewrites {
      glob = "**"
      path = "/index.html"
    }
  }
}

resource "google_firebase_hosting_release" "main" {
  provider     = google-beta
  site_id      = google_firebase_hosting_site.main.site_id
  version_name = google_firebase_hosting_version.main.name
  message      = "Terraform managed release"
}
