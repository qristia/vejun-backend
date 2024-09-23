import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { chooseFormat, getInfo } from 'ytdl-core';
import { YoutubeSearchResult } from './dto/videos-response.dto';

@Injectable()
export class YoutubeService {
  constructor(private readonly configService: ConfigService) {}
  private youtubeUrl = "https://www.googleapis.com/youtube/v3/search"

  async getVid(vid: string) {
    if (!vid || typeof vid !== 'string') {
      throw new BadRequestException(
        'video url or id must be included as query params',
      );
    }

    try {
      const video = await getInfo(vid);

      const videoFormats = chooseFormat(video.formats, {
        filter: 'videoonly',
        // quality: 'highestvideo',
        // format: { container: 'mp4' },
      });

      const audioFormats = chooseFormat(video.formats, {
        filter: 'audioonly',
        // quality: 'highestaudio',
      });

      return {
        audio: audioFormats.url,
        video: videoFormats.url,
        thumbnails: video.videoDetails.thumbnails,
      };
    } catch (e) {
      throw new NotFoundException('Video not found');
    }
  }

  async searchVideo(query: string, max = 10): Promise<YoutubeSearchResult> {
    const apiKey = this.configService.get<string>("YT_API_KEY");
    try {
      const videos = await axios.get<YoutubeSearchResult>(this.youtubeUrl, {
        params: {
          part: 'snippet',
          q: query,
          maxResults: max,
          type: 'video',
          key: apiKey,
        },
      });
      return videos.data;
    } catch (e) {
      if (e instanceof AxiosError) {
        console.log(e.response.data);
      }
      throw e;
    }
  }
}
