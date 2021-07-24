from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
from .models import *


def ping_view(request):
    if request.method == "GET":
        return render(request, 'control/ping.html',)

    if request.method == "POST":
        hosts = request.POST.get('data_input', '')
        hosts = hosts.split()
        obj = Control()
        data = json.dumps(obj.ping(hosts))
        print(data)
        return HttpResponse(data, content_type="application/json")


def ip_calc_view(request):
    if request.method == "GET":
        return render(request, 'control/ip_calc.html',)

    if request.method == "POST":
        ip, prefix = request.POST.getlist('data_input[]', [0, 0])
        obj = Control()
        data = json.dumps(obj.info_about_ip(ip, prefix))
        return HttpResponse(data, content_type="application/json")


def snmp_view(request):
    if request.method == "GET":
        return render(request, 'control/snmp.html',)

    if request.method == "POST":
        ip, oid = request.POST.getlist('data_input[]', [0, 0])
        obj = Control()
        data = json.dumps(obj.snmp(ip, oid, settings.COMMUNITY_SNMP))
        return HttpResponse(data, content_type="application/json")


def mac_view(request):
    if request.method == "GET":
        return render(request, 'control/mac.html',)

    if request.method == "POST":
        mac = request.POST.get('data_input', '')
        obj = Mac(mac)
        data = json.dumps(obj.get_vendor())
        return HttpResponse(data, content_type="application/json")
