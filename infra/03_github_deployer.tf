resource "google_service_account" "github_deployer" {
  account_id   = "github-deployer"
  display_name = "github-deployer"
}

module "gh_oidc" {
  source      = "terraform-google-modules/github-actions-runners/google//modules/gh-oidc"
  project_id  = local.props.gcp.project_id
  pool_id     = "github"
  provider_id = "actions"
  sa_mapping = {
    "github-deployer" = {
      sa_name   = google_service_account.github_deployer.name
      attribute = "attribute.id/repo:${local.repo}:ref:refs/heads/main"
    }
  }
  attribute_condition = <<EOT
    assertion.repository == "${local.repo}" &&
    assertion.ref == "refs/heads/main" &&
    assertion.ref_type == "branch"
  EOT
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.id"         = "\"repo:\" + assertion.repository + \":ref:\" + assertion.ref"
    "attribute.actor"      = "assertion.actor"
    "attribute.aud"        = "assertion.aud"
    "attribute.repository" = "assertion.repository"
  }
}

resource "google_project_iam_member" "deployer_permissions" {
  for_each = toset(["roles/firebasehosting.admin", "roles/artifactregistry.createOnPushWriter", "roles/run.developer"])
  project  = data.google_project.main.project_id
  role     = each.value
  member   = google_service_account.github_deployer.member
}

resource "google_service_account_iam_member" "deployer_permissions" {
  service_account_id = google_service_account.cloud_run_agent.name
  role               = "roles/iam.serviceAccountUser"
  member             = google_service_account.github_deployer.member
}

resource "github_actions_variable" "wif_provider" {
  repository    = local.repo_name
  variable_name = "WIF_PROVIDER"
  value         = module.gh_oidc.provider_name
}

resource "github_actions_variable" "sa_email" {
  repository    = local.repo_name
  variable_name = "SA_EMAIL"
  value         = google_service_account.github_deployer.email
}
