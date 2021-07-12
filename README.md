# Face Me (Version 1.0.0)
#### *A Peer to Peer video Conferencing Website*
![Video Photo](/public/assets/call.png)

## Table of Contents
  - [Website Demo](#website-demo)
  - [Tech Stack](#tech-stack)
  - [About](#about)
  - [Installation Prerequisites](#installation-prerequisites)
  - [How to Run this Website](#how-to-run-this-website)

## Website Demo
[Click Here to Watch Video](https://youtu.be/dkVzDjc2aIo) \
[Click Here to See the Project Planning Presentation](https://1drv.ms/p/s!Aj0KFZJOAy1vfYBAGH8IpCqWRJ4?e=hif3RF) \
**Watch the video in 720p or higher and you can also use the English auto-generated captions which work perfectly with the video**

## Tech Stack
1. NodeJs
2. MongoDB Atlas
3. Socket.io
4. Peerjs

## About
This is a peer to peer video conferencing website where a user can chats, Video call with the additional feature of Notepad where Users can collaborate on notes and whiteboard.

### Flow of the Website
- The User will first Sign Up by going to the `/auth` page and then Sign In on the same page
- The User can then user any of the four feature
- the users  can make the payments online using this website.
  - Video call a Friend
  - Create a collaborative notepad
  - Chat with other people
  - Open Notepad History.
- **Video Call**: In this page a user can chat, talk with other user along with there video being show. They can also share their screen and see the Joining Logs of the Meeting.
- **Collaborative Notepad**: In this page the users can collaborate on notes, whiteboard provided on the page. Multiple users can access the notes and whiteboard and can edit the same.
- **Chats**: A chat room will automatically be created when you create a Video room and the user who were present on the video call will then be able to send messages. A user can also create a chat room without joining a video room and can then communicate with other users.

## Installation Prerequisites
- Nodejs

>To Download Nodejs Package(Node Version 12) [Go to the Nodejs Download Website](https://nodejs.org/en/download/).


## How to Run this Website
1. Clone this Repo to your Local Machine using `git clone https://github.com/seneark/Face-Me.git`.
2. Open The Terminal/CMD in the folder Face-Me.
3. Type ```npm i``` to install all the required packages.
4. Change the variable in `.env-template` to your own mongo atlas host, user and password and rename it to `.env`.
5. Type ```npm start``` to run the nodejs server.
6. Open [localhost:3030](localhost:3030/) in your browser and you will be redirected to SignUp/SignIn page.
7. Enjoy!!! :tada: :sparkles:

**If you want to contribute to this website then read the [CONTRIBUTION](/CONTRIBUTION.md) file before making any contribution.**

## Limitations
- The hosted platform(heroku) being a free one send the data very slowing so there might be a delay in joining the video room due to sending a video stream however the website works smoothly on local machine.
