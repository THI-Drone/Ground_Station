import time


def drone_ready():
    return {
        "type": "log",
        "content": "Drone online and ready."
    }


def drone_position():
    return {
        "type": "position",
        "content": {"x": "312", "y": "123", "h": "22"}
    }


def scanned_qr_code():
    return {
        "type": "log",
        "content": "Successfully scanned QR-Code. Flying to XX.XXXXXX YY.YYYYYY at 20m."
    }


def heartbeat_node1_active(i):
    return {
        "type": "heartbeat",
        "content": {
            "sender_id": "node1",
            "tick": i,
            "active": True,
            "timestamp": time.time()
        }
    }


def heartbeat_node2(i, active):
    return {
        "type": "heartbeat",
        "content": {
            "sender_id": "node2",
            "tick": i,
            "active": active,
            "timestamp": time.time()
        }
    }


def log_INFO():
    return {
        "type": "log",
        "content": {
            "level": "INFO",
            "name": "node_foo",
            "msg": "This is an info log."
        }
    }


def log_WARN():
    return {
        "type": "log",
        "content": {
            "level": "WARN",
            "name": "node_foo",
            "msg": "This is a WARN log."
        }
    }


def log_ERROR():
    return {
        "type": "log",
        "content": {
            "level": "ERROR",
            "name": "node_foo",
            "msg": "This is an ERROR log."
        }
    }


def log_FATAL():
    return {
        "type": "log",
        "content": {
            "level": "FATAL",
            "name": "node_foo",
            "msg": "This is a FATAL log."
        }
    }
