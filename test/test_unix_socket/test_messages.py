
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
