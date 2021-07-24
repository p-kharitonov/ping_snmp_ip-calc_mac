import time

from snmp import Manager
from snmp.exceptions import Timeout


def get_snmp(host, oid):
    manager = Manager(b'public')
    try:
        vars = [[var.name, var.value] for var in manager.get(host, oid)]
    except Exception:
        vars = []
    if len(vars) < 1:
        try:
            vars = [[item.name, item.value] for var in manager.walk(host, oid) for item in var]
        except Exception:
            vars = []
    manager.close()
    return vars


def main():
    host = "172.16.53.3"
    oid = "1.3.6.1.2.1.4.22.1.2"
    start = time.time()
    data = get_snmp(host, oid)
    print(data)
    end = time.time()
    print("Took {} seconds".format(end - start))

if __name__ == '__main__':
    main()