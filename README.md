# Software Switch - Hybrid Peer to Peer and Content Server Switch architecture for Video Downlaods and Live Video Streaming

## Overview
The hybrid architecture of Content server (CS) and peer to peer (P2P) is promising in providing online media streaming and downloading services. This works on the principle that the Content server can serve limited number of clients concurrently while maintaining optimal load on server.

The first priority to fetch video chunks is given to Content server. If the Content server is over-loaded and can't handle any more traffic then it requests the p2p-signalling server to look for the packets of the requested video in the swarm of users using peer to peer connection. During the packet-requesting process, if the content server again becomes available to provide chunks of data then connection is established to serve the video chunks again.
The file chunks are stored in MongoDB using **Grid.FS** library.

## What do we solve
We are creating an architecture to minimize the server hosting cost. We are finding optimal spot between server-cost v/s fetch-time. 


## Control Flow
1. The client requests the Content server for a list of videos available
2. Client asks for a specific video from the Content server
3. If the Content server has number of connections less than the optimal number then the packets are sent to the client.
4. If Content server is over-loaded then it provides the unique ID of the video chunk to the client and it can request the file to the peers.
5. The peer to peer connection is established through holepunching and the packets are exchanged.
6. If the Content server becomes live again the packets are requested


![alt text](./Screenshot%20from%202024-04-04%2023-04-31.png)


## Components
* Client - The client in build on ElectronJS and is based purely on WebRTC implementation to request for packets. The packets are currently being stored in map and on recieving all packets, it compiles it to a full video file. For p2p communication, it requests its STUN/TURN server for SDP-token. After swapping SDP's, it establishes communication using hole-punching, establishing communication for packets transfer.
* Signalling Server - A signalling server is setup for maintaining a swarm and swapping the SDP's of two peers - seeder and leecher.
* Content server(or a general resource provding server) - A content server is set-up to share video chunks, if available and if packets denied then it provides them with unique-ids.

## Inspiration 
We took inspiration from a hybrid p2p & server-client architecture based startup (**Konkan**) which is a large videos streaming platform. This architecture was a massive breakthrough for all low-budget organizations and early startups to manage their servers cost-effectively.

## Problems Faced
* Finding optimal state for content delivery server to switch from server-client to p2p swarm.
* Establishing hole-punching between two peer devices which are in open internet behind different NATs using WebRTC.

## Future Scope
* Implementing the live streaming of video by understanding the metadata of the video and sending the packets accordingly to play the byte stream available to the user.
* Publish this as a opinionated library or infra for the developers to integrate in their projects.
* Optimizing p2p connection by implementing RTT lookup table, updated through regular interval pings and maintaining seeder preference list for prioritizing leechers.
