import os

import requests


class StorageNotConfigured(Exception):
    pass


def _config():
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    bucket = os.environ.get("SUPABASE_STORAGE_BUCKET", "product-images")
    if not url or not key:
        return None
    return url, key, bucket


def upload_image(filename, data, content_type):
    """Uploads image bytes to the Supabase Storage bucket and returns its public URL."""
    config = _config()
    if not config:
        raise StorageNotConfigured(
            "Envio de fotos não configurado: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
        )
    base_url, key, bucket = config

    response = requests.post(
        f"{base_url}/storage/v1/object/{bucket}/{filename}",
        headers={"Authorization": f"Bearer {key}", "Content-Type": content_type},
        data=data,
        timeout=15,
    )
    response.raise_for_status()
    return f"{base_url}/storage/v1/object/public/{bucket}/{filename}"


def delete_image(filename):
    """Best-effort delete of a previously uploaded image; failures are ignored."""
    config = _config()
    if not config or not filename:
        return
    base_url, key, bucket = config
    try:
        requests.delete(
            f"{base_url}/storage/v1/object/{bucket}/{filename}",
            headers={"Authorization": f"Bearer {key}"},
            timeout=15,
        )
    except requests.RequestException:
        pass
