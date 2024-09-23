import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { RedisService } from 'src/redis/redis.service';
import { RoomService } from 'src/room/room.service';

export type RoomJobNames = 'room.deletion' | 'room.creation';

export type RoomDeletionData = {
  roomId: string;
};

export type RoomQueue = Queue<RoomDeletionData, any, RoomJobNames>;

@Processor('room')
export class RoomConsumer extends WorkerHost {
  constructor(
    private readonly roomService: RoomService,
    private readonly redisService: RedisService,
  ) {
    super();
  }

  async process(job: Job<RoomDeletionData, any, RoomJobNames>): Promise<any> {
    switch (job.name) {
      case 'room.deletion': {
        const { roomId } = job.data;
        await this.redisService.getClient().del(`room:${roomId}:deletionJob`);
        await this.roomService.deleteRoom(roomId);
      }
    }
  }
}
