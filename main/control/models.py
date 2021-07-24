import os
import subprocess
import ipaddress
import re
import json
from django.conf import settings
from pysnmp.entity.rfc3413.oneliner import cmdgen


class Control:
    def __init__(self) -> None:
        pass
    
    def ping(self, devices: list) -> dict:
        try:
            return {'success': True, 'data': self._get_ping(devices)}
        except Exception as e:
            print(e)
            return {'success': False, 'detail': 'ERROR'}
        
    def info_about_ip(self, ip: str, mask: str) -> dict:
        try:
            return {'success': True, 'data': self._get_info_about_ip(ip, mask)}
        except ValueError:
            return {'success': False, 'detail': 'Invalid IP address format'}

    def snmp(self, host: str, oid: str, community: str) -> dict:
        try:
            return {'success': True, 'data': self._get_snmp(host, oid, community)}
        except ValueError as e:
            return {'success': False, 'detail': str(e)}
        except Exception as e:
            print(e)
            return {'success': False, 'detail': 'ERROR'}

    def _get_ping(self, devices: list) -> list:
        hosts = self._get_hosts(devices)
        result_ping_of_hosts = []
        if len(hosts) > 0:
            my_keys = ['-r', '2']
            command = ['fping'] + my_keys + hosts
            process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            result_ping_of_hosts, stderr = process.communicate()
            result_ping_of_hosts = result_ping_of_hosts.decode("utf-8").split('\n')
        availability = []
        for device in devices:
            for item in result_ping_of_hosts:
                if item.startswith(''.join([device, ' '])):
                    if 'is alive' in item:
                        availability.append({device: '0'})
                    else:
                        availability.append({device: '1'})
                    result_ping_of_hosts.remove(item)
                    break
            else:
                availability.append({device: '2'})
        return availability

    def _get_hosts(self, devices: list) -> list:
        hosts = []
        for element in [element.strip() for element in devices if element]:
            if self._check_ip(element):
                hosts.append(element)
            elif self._check_domain(element):
                hosts.append(element)
            elif self._check_subnet(element):
                hosts += self._get_all_ip_from_subnet(element)
        return hosts

    @staticmethod
    def _check_ip(host: str) -> bool:
        try:
            ipaddress.ip_address(host)
            return True
        except ValueError:
            return False

    @staticmethod
    def _check_domain(host: str) -> bool:
        try:
            pattern_domain = '^[a-zA-Z0-9]([a-zA-Z0-9-]+\.){1,}[a-zA-Z0-9]+\Z'
            if re.fullmatch(pattern_domain, host):
                return True
            else:
                return False
        except ValueError:
            return False

    @staticmethod
    def _check_subnet(host: str) -> bool:
        try:
            prefix = ipaddress.ip_interface(host).network.prefixlen
            if 30 >= prefix >= 24:
                return True
            else:
                return False
        except ValueError:
            return False

    @staticmethod
    def _get_all_ip_from_subnet(host: str) -> list:
        try:
            interface = ipaddress.ip_interface(host)
            subnet = interface.network
            all_ip = list(map(str, subnet.hosts()))
            return all_ip
        except ValueError:
            return []

    @staticmethod
    def _get_info_about_ip(ip: str, mask: str) -> dict:
        interface = ipaddress.ip_interface('/'.join([ip, mask]))
        _subnet = interface.network
        _, wildcard = _subnet.with_hostmask.split('/')
        subnet, netmask = _subnet.with_netmask.split('/')
        if int(mask) == 32:
            subnet = broadcast = ip_min = ip_max = '-'
            ip_all = str(_subnet.num_addresses)
        elif int(mask) == 31:
            broadcast = str(_subnet.broadcast_address)
            ip_min = str(_subnet[0])
            ip_max = str(_subnet[1])
            ip_all = str(_subnet.num_addresses)
        else:
            broadcast = str(_subnet.broadcast_address)
            ip_min = str(_subnet[1])
            ip_max = str(_subnet[2])
            ip_all = str(_subnet.num_addresses - 2)

        info_about_ip = dict()
        info_about_ip['ip'] = ip
        info_about_ip['subnet'] = subnet
        info_about_ip['netmask'] = netmask
        info_about_ip['prefix'] = mask
        info_about_ip['ip_min'] = ip_min
        info_about_ip['ip_max'] = ip_max
        info_about_ip['broadcast'] = broadcast
        info_about_ip['wildcard'] = wildcard
        info_about_ip['ip_all'] = ip_all
        return info_about_ip

    def _get_snmp(self, host: str, oid: str, community: str) -> list:
        if not self._check_ip(host) or not self._check_domain(host):
            raise ValueError('Invalid Host address')
        if not self._check_oid(oid):
            raise ValueError('Invalid OID format')
        if self._get_ping([host])[0][host] != '0':
            raise ValueError('Host unreachable')
        else:
            result = []
            cmd_gen = cmdgen.CommandGenerator()
            error_indication, error_status, error_index, var_bind_table = cmd_gen.nextCmd(
                cmdgen.CommunityData(community),
                cmdgen.UdpTransportTarget((host, 161)),
                oid
            )
            if error_indication:
                return result
            else:
                if error_status:
                    return result
                else:
                    for var_bind_table_row in var_bind_table:
                        for name, val in var_bind_table_row:
                            path = name.prettyPrint()
                            result.append([path, val.prettyPrint()])
            if len(result) < 1:
                oid = '.'.join(oid.split('.')[:-1])
                result = self._get_snmp(host, oid, community)
            return result

    @staticmethod
    def _check_oid(oid):
        pattern_oid = r'[0-9.]{5,63}'
        reg = re.match(pattern_oid, oid)
        if reg:
            return True
        else:
            return False


class Mac:
    def __init__(self, mac: str) -> None:
        self.mac = mac

    def get_vendor(self) -> dict:
        mac = self.mac.strip()
        if not self._check_mac(mac):
            return {'success': False, 'detail': 'Invalid MAC address format'}
        else:
            vendor_id = self._get_vendor_id(mac)
            data = self._get_data_from_json()
            vendor_detail = data.get(vendor_id)
            if vendor_detail is None:
                return {'success': False, 'detail': 'MAC address is missing in the database'}
            else:
                mac_spelling = self._get_mac_spelling(mac)
                return {'success': True, 'data': {'vendor_detail': vendor_detail, 'mac_spelling': mac_spelling}}

    @staticmethod
    def _check_mac(mac: str) -> bool:
        pattern_mac = r'([0-9a-fA-F]{2}[.:-]{,1}){6}\b|([0-9a-fA-F]{4}[.:-]{,1}){3}\b|([0-9a-fA-F]{12}[.:-]{,1})\b'
        reg = re.match(pattern_mac, mac)
        if reg:
            return True
        else:
            return False

    @staticmethod
    def _get_vendor_id(mac: str) -> str:
        return re.sub(r'[.:-]', '', mac).upper()[:6]

    @staticmethod
    def _get_data_from_json() -> json:
        path = os.path.join(settings.BASE_DIR, 'control/oui.json')
        with open(path) as f:
            data = json.load(f)
        return data

    @staticmethod
    def _get_mac_spelling(mac: str) -> list:
        raw = re.sub(r'[.:-]', '', mac).lower()
        mac_spelling = set()
        mac_spelling.add(mac)
        mac_spelling.add(mac.lower())
        mac_spelling.add(mac.upper())
        pieces_mac_quad = [raw[0:4], raw[4:8], raw[8:]]
        pieces_mac_double = [raw[0:2], raw[2:4], raw[4:6], raw[6:8], raw[8:10], raw[10:]]
        for pieces_mac in [pieces_mac_quad, pieces_mac_double]:
            for symbol in ['.', '-', ':']:
                mac_spelling.add(symbol.join(pieces_mac))
                mac_spelling.add(symbol.join(pieces_mac).upper())
        return list(mac_spelling)
