export interface UserInterface {
  name: string;
  email: string;
  phone: number;
  avatar: {
    url: string;
    altText: string;
  };
  password: string;
  role: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
