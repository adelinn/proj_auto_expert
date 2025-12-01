resource "google_dns_managed_zone" "main" {
  name     = "autoexpert-qzz-io"
  dns_name = local.dns_zone

  depends_on = [google_project_service.main["dns.googleapis.com"]]
}

resource "google_dns_record_set" "frontend" {
  name         = "app.${google_dns_managed_zone.main.dns_name}"
  managed_zone = google_dns_managed_zone.main.name
  type         = google_firebase_hosting_custom_domain.main.required_dns_updates[0].desired[0].records[0].type
  ttl          = 3600
  rrdatas      = ["${google_firebase_hosting_custom_domain.main.required_dns_updates[0].desired[0].records[0].rdata}."]
}
