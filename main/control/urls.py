from django.urls import path
from .views import mac_view, ping_view, ip_calc_view, snmp_view

urlpatterns = [
    path('mac/', mac_view, name='mac'),
    path('ping/', ping_view, name='ping'),
    path('ip_calc/', ip_calc_view, name='ip_calc'),
    path('snmp/', snmp_view, name='snmp'),
]