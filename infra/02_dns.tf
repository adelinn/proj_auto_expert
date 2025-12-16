resource "google_dns_managed_zone" "main" {
  name     = "autoexpert-qzz-io"
  dns_name = local.dns_zone

  depends_on = [google_project_service.main["dns.googleapis.com"]]
}

resource "google_dns_record_set" "frontend" {
  name         = "app.${google_dns_managed_zone.main.dns_name}"
  managed_zone = google_dns_managed_zone.main.name
  type         = "cname"
  ttl          = 3600
  rrdatas      = ["placeholder."]

  lifecycle {
    ignore_changes = [type, rrdatas]
  }
}
