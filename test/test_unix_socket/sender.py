"""
The goal of this script is to create a UNIX-socket, wait for connections to it, and then send
dummy messages.

"""

import json
import os
import random
import select
import socket
import sys
import time
import test_messages as tm

DEFAULT_UNIX_SOCKET_PATH = "/tmp/thi_drone"


def socket_exists(socket_path: str) -> bool:
    """
    Checks rather if a socket-file already exists on the given path.
    """
    return os.path.exists(socket_path)


def send_message_block(client_socket):
    """
    Defines the message block to be continuosly send.
    """
    client_socket.sendall(
        json.dumps(tm.drone_ready()).encode() + b"\x17")
    print("Send message.")
    # time.sleep(random.randint(1, 3))
    client_socket.sendall(
        json.dumps(tm.drone_position()).encode() + b"\x17")
    print("Send message.")
    # time.sleep(random.randint(1, 3))
    client_socket.sendall(
        json.dumps(tm.scanned_qr_code()).encode() + b"\x17")
    print("Send message.")
    # time.sleep(random.randint(1, 3))


def run_dummy_server(socket_path=DEFAULT_UNIX_SOCKET_PATH):
    # Check if socket is in use
    if socket_exists(socket_path):
        raise FileExistsError("Socket file already exists.")

    # Create a socket
    server_socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)

    try:
        # Bind socket
        server_socket.bind(socket_path)

        # Listen for connection
        server_socket.listen(1)
        print("Listening for connection on", socket_path, "...")

        while True:
            readable, _, _, = select.select([server_socket], [], [])
            for sock in readable:
                if sock == server_socket:
                    # Accept the connection
                    client_socket, _ = server_socket.accept()
                    print("Connection accepted.")

                    try:
                        while True:
                            send_message_block(client_socket)

                    except Exception as e:
                        print("Error sendind data:", e)
                    finally:
                        # Close client socket
                        client_socket.close()

    except Exception as e:
        print("Error occured:", e)
    finally:
        server_socket.close()
        os.remove(socket_path)


if __name__ == '__main__':
    if len(sys.argv) > 1:
        run_dummy_server(sys.argv[2])
    else:
        run_dummy_server()
