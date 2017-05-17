# DRFBro

A Django extension that provides a better Django REST Framework browser.

![Screenshot 1](images/i1.png)
![Screenshot 2](images/i2.png)
![Screenshot 3](images/i3.png)

# Requirements

- Django 1.9+
- Django REST Framework 3.6+

# Installation

1. Install DRFBro

    ```sh
    pip install drfbro
    ```

2. Add it to your INSTALLED_APPS

    ```python
    INSTALLED_APPS = [
        # ...
        'rest_framework',
        'rest_framework.authtoken',  # Required for DRFBro authentication
        # ...
        'drfbro',
        # ...
    ]
    ```

3. Enable `TokenAuthentication`  in your DRF config

    ```python
    REST_FRAMEWORK = {
        'DEFAULT_AUTHENTICATION_CLASSES': (
            # ...
            'rest_framework.authentication.TokenAuthentication',
            # ...
        ),
    }
    ```

4. Add DRFBro to your `urls.py`:

    ```python
    urlpatterns = [
        # ...
            url(r'^drfbro/', include('drfbro.urls')),
        # ...
    ]
    ```

5. Navigate to `http://127.0.0.1:8000/drfbro`

# License

The license is MIT.
