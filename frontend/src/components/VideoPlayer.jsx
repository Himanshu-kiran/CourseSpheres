import ReactPlayer from 'react-player';

const VideoPlayer = ({ url, onEnded, onProgress }) => {
  return (
    <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden shadow-lg">
      <ReactPlayer
        className="absolute top-0 left-0"
        url={url}
        width="100%"
        height="100%"
        controls={true}
        onEnded={onEnded}
        onProgress={onProgress}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload'
            }
          }
        }}
      />
    </div>
  );
};

export default VideoPlayer;
