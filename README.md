# Software Switch - Hybrid Peer to Peer or CDN architecture for Video Downlaods and Live Video Streaming

The hybrid architecture of content distribution network (CDN) and peer to peer (P2P) is promising in providin online streaming media or downloading services. This works on the principle that the CDN can hold only so many users at one point concurrently, the first priority for downloading and streaming is given to the CDN only.

If the CDN is completely busy and can't handle any more traffic then it requests the signalling server to look for the packets of the same video in the swarm of users using peer to peer connection. During this process if the CDN becomes live again and is available to provide chunks of data then connection is established to the CDN again.
The file chunks are stored in MongoDB with the help of **Grid.FS** library.

Note - We have currently implemented a POC for just downloading the file as of now. We faced with difficulty with playing a byte stream of data as each chunk need to proper metadata etc, so we couldn't implement streaming of video.

## Control Flow
1. The client is requests the CDN for a list of videos available
2. Client requests a specific a video from the CDN
3. If the CDN has available then the packets are sent to the client and the client can then send seed or download the file
4. If CDN is unavailable then it provides the unique ID of the video to the client and it can request the file to the peers.
5. The peer to peer connection is established and packers are exchanged.
6. If the CDN becomes live again the packets are requested


## Components
* Client - The client in build in ElectronJS and using pure implementation of WebRTC to request for packets. The packets are currently being stored in map and if all packets are received then user can download it.
* Signalling Server -
* CDN(or a general resource provding server) -

## Inspiration 
Mention of a such a hybrid architecture in the **Computer Networking - A Top-Down Approach**.

## Future Scope
* Implementing the live streaming of video by understanding the metadata of the video and sending the packets accordingly to play the byte stream available to the user.
* Publish this as a opinionated library or infra for the developers to integrate in their projects.
