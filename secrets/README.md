# Credenciales locales (nunca en Git)

Coloca aquí el JSON de la cuenta de servicio Google Cloud:

```
secrets/google-wallet-sa.json
```

Descárgalo en: https://console.cloud.google.com/iam-admin/serviceaccounts

Luego ejecuta:

```bash
npm run wallet:google-bootstrap
npm run wallet:google-auto
```

O en un solo paso si ya tienes el archivo en otra ruta:

```bash
npm run wallet:google-bootstrap -- ~/Downloads/mi-proyecto-xxxxx.json
npm run wallet:google-auto
```

Autoriza el email `...@...iam.gserviceaccount.com` en Pay Console → Usuarios autorizados.
