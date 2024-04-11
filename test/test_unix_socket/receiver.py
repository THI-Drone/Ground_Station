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

        while True:
            # Use select to wait until there is data to read on the socket
            readable, _, _ = select.select([client_socket], [], [])

            for sock in readable:
                # Receive data from the server
                received_data = sock.recv(1024)

                # If no data is received, close the connection
                if not received_data:
                    print("No data received. Closing connection.")
                    client_socket.close()
                    exit()

                # Decode the received data from bytes to JSON
                json_data = json.loads(received_data.decode())
                print("Received JSON data:", json_data)

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
