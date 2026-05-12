import { UserProfileResponseDto } from '../dto/user-profile-response.dto';
import { User } from '../entities/user.entity';

export const mapUserToProfileResponse = (
  user: User,
): UserProfileResponseDto => ({
  id: user.id,
  firstname: user.firstname,
  lastname: user.lastname,
  email: user.email,
  createdAt: user.createdAt,
});
