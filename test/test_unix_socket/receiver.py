"""
The goal of this script is to connect to an existing UNIX-socket an listen for everything.

"""

import json
import select
import socket
import sys


DEFAULT_UNIX_SOCKET_PATH = "/tmp/thi_drone"


def run_dummy_listener(socket_path=DEFAULT_UNIX_SOCKET_PATH):

    # Create a socket
    client_socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)

    try:
        # Bind socket
        print("Trying to connect to server at", socket_path, "...")
        client_socket.connect(socket_path)
        print("Connected to server.")

        buffer = ""
        while True:
            # Receive data from the server
            buffer = buffer + client_socket.recv(1024).decode()
            blocks = buffer.split(chr(23))
            buffer = blocks.pop()

            # Decode the received data from bytes to JSON
            for elem in list(blocks):
                json_data = json.loads(elem)
                print("Received JSON data:", json_data)
                blocks.remove(elem)

    except Exception as e:
        print("Error:", e)
    finally:
        # Close the connection
        client_socket.close()


if __name__ == '__main__':
    if len(sys.argv) > 1:
        run_dummy_listener(sys.argv[1])
    else:
        run_dummy_listener()
