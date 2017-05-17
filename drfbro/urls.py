from django.conf.urls import url
from rest_framework.schemas import get_schema_view
from rest_framework.authtoken.views import obtain_auth_token

from . import views

urlpatterns = [
    url(r'^$', views.index, name='drfbro-index'),
    url(r'^schema$', get_schema_view(), name='drfbro-schema'),
    # url(r'^login$', views.log_in, name='drfbro-login'),
    # url(r'^logout$', views.log_out, name='drfbro-logout'),
    url(r'^state$', views.StateView.as_view(), name='drfbro-state'),
    url(r'^api-token-auth$', obtain_auth_token, name='drfbro-login')
]
