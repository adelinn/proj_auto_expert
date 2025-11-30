terraform {
  required_version = ">= 1.4.6"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.3"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 7.3"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.8"
    }
  }
}

locals {
  dns_zone   = "autoexpert.qzz.io."
  app_domain = "app.autoexpert.qzz.io"
  repo_owner = "adelinn"
  repo_name  = "proj_auto_expert"
  repo       = "${local.repo_owner}/${local.repo_name}"
  props = {
    gcp = {
      location   = "europe-west4"
      project_id = "auto-expert-479412"
    }
  }
}

data "google_project" "main" {}

provider "google" {
  region                = local.props.gcp.location
  project               = local.props.gcp.project_id
  billing_project       = local.props.gcp.project_id
  user_project_override = true
}

provider "google-beta" {
  region                = local.props.gcp.location
  project               = local.props.gcp.project_id
  billing_project       = local.props.gcp.project_id
  user_project_override = true
}

# Configures the provider to not use the resource block's specified project for quota checks.
# This provider should only be used during project creation and initializing services.
provider "google-beta" {
  alias                 = "no_user_project_override"
  region                = local.props.gcp.location
  project               = local.props.gcp.project_id
  user_project_override = false
}

provider "github" {
  # Configuration options
}
