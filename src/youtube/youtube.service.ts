import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { chooseFormat, getInfo } from 'ytdl-core';

@Injectable()
export class YoutubeService {
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
}
