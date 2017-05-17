# DRFBro

A Django extension that provides a better Django REST Framework browser.

# Requirements

- Django 1.9+
- Django REST Framework 3.6+

# Installation

1. Install DRFBro

    pip install drfbro

2. Add it to your INSTALLED_APPS

    INSTALLED_APPS = [
        # ...
        'rest_framework',
        'rest_framework.authtoken',  # Required for DRFBro authentication
        # ...
        'drfbro',
        # ...
    ]

3. Enable `TokenAuthentication`  in your DRF config

    REST_FRAMEWORK = {
        'DEFAULT_AUTHENTICATION_CLASSES': (
            # ...
            'rest_framework.authentication.TokenAuthentication',
            # ...
        ),
    }

4. Add DRFBro to your `urls.py`:

    urlpatterns = [
        # ...
            url(r'^drfbro/', include('drfbro.urls')),
        # ...
    ]

5. Navigate to `http://127.0.0.1:8000/drfbro`

# License

The license is MIT.
