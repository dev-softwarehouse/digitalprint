import * as io from "socket.io-client";

let socketObject: SocketIOClient.Socket;

export const socketConnect = (
    tokenString: any
) => {

    if( tokenString.length > 0  ) {
        // @TODO get this url from env
        socketObject = io("http://editorapi.localtest.me", {
            query: {token: tokenString}
        });
        return socketObject;
    }

    socketObject = io("http://editorapi.localtest.me");
    return socketObject;
};

export const getSocketObject = () => {
    return socketObject;
};