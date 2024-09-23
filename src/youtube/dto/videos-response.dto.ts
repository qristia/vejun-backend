export interface YoutubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YoutubeVideoResponse {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: YoutubeThumbnail;
      medium: YoutubeThumbnail;
      high: YoutubeThumbnail;
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: Date;
  };
}

export interface YoutubeSearchResult {
  nextPageToken: string;
  pageInfo: {
    totalResult: number;
    resultsPerPage: number;
  };
  items: YoutubeVideoResponse[];
}
