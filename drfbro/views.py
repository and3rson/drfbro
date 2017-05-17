import datetime

from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import LoginSerializer


def set_cookie(response, key, value, days_expire=7):
    if days_expire is None:
        max_age = 365 * 24 * 60 * 60  # one year
    else:
        max_age = days_expire * 24 * 60 * 60
    expires = datetime.datetime.strftime(datetime.datetime.utcnow() + datetime.timedelta(seconds=max_age), "%a, %d-%b-%Y %H:%M:%S GMT")
    response.set_cookie(key, value, max_age=max_age, expires=expires)


def index(request):
    return render(request, 'drfbro/index.html')


@csrf_exempt
def log_in(request):
    serializer = LoginSerializer(data=dict(
        username=request.POST.get('username'),
        password=request.POST.get('password'),
    ))
    if not serializer.is_valid():
        return JsonResponse(dict(
            errors=serializer.errors,
        ), status=400)
    user = authenticate(
        username=serializer.data['username'],
        password=serializer.data['password']
    )
    if user:
        login(request, user)
        return JsonResponse(dict(
            success=True
        ), status=200)
    else:
        return JsonResponse(dict(
            non_field_errors=[
                'Wrong username or password.'
            ]
        ), status=400)


class StateView(APIView):
    def get(self, request):
        return Response(dict(
            authenticated=request.user.is_authenticated(),
            username=request.user.username if request.user.is_authenticated else None
        ))
