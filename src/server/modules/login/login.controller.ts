import { Controller, InjectCtx, RequestContext, Post, UseGuards, Get, UseMiddlewares, Body, Contract } from 'bwcx-ljsm';
import RandomGuard from '../../guards/random';
import LoginMiddleware from '@server/middlewares/login.middleware';
import {
  LoginReqDTO,
  LoginResDTO,
  SessionResDTO,
  RegisterReqDTO,
  RegisterResDTO,
  UploadResDTO,
} from '@common/modules/login/login.dto';
import { Api } from 'bwcx-api';
import { ApiController } from '@server/decorators';
import * as CryptoJS from 'crypto-js';
import fs from 'fs';
import path from 'path';
import HttpException from '@server/exceptions/http.exception';
import multer from 'multer';

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public/avatar');
    // 确保目录存在
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳 + 随机数 + 原始扩展名
    const ext = path.extname(file.originalname);
    const filename = `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
    cb(null, filename);
  },
});

// 文件过滤器，只允许图片文件
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'), false);
  }
};

// 创建multer实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB限制
  },
});

@ApiController()
@UseMiddlewares(LoginMiddleware)
export default class LoginController {
  public constructor(
    @InjectCtx()
    private readonly ctx: RequestContext,
  ) {}

  /** routes */
  @Api.Summary('User login')
  @Post('/login')
  @Contract(LoginReqDTO, LoginResDTO)
  async login(@Body() req: LoginReqDTO): Promise<LoginResDTO> {
    console.log('login called with:', req);

    try {
      // 读取用户数据文件
      const userStorePath = path.join(__dirname, '../../store/user.store.json');
      const userData = JSON.parse(fs.readFileSync(userStorePath, 'utf8'));

      // 查找用户
      const user = userData.users.find((u: any) => u.username === req.username);
      if (!user) {
        this.ctx.status = 401;
        throw new HttpException(401);
      }

      // 验证密码（使用MD5加密）
      const hashedPassword = CryptoJS.MD5(req.password).toString();
      if (user.password !== hashedPassword) {
        this.ctx.status = 401;
        throw new HttpException(401);
      }

      // 登录成功，设置session
      this.ctx.session.user = {
        username: user.username,
        loginTime: new Date().toISOString(),
      };
      this.ctx.session.userId = user.userId;

      return {
        rows: [{ username: user.username, password: '' }], // 不返回密码
        message: '登录成功',
      };
    } catch (error) {
      console.error('登录过程中发生错误:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      this.ctx.status = 500;
      throw new HttpException(500);
    }
  }

  @Api.Summary('User register')
  @Post('/register')
  @Contract(RegisterReqDTO, RegisterResDTO)
  async register(@Body() req: RegisterReqDTO): Promise<RegisterResDTO> {
    console.log('register called with:', { username: req.username });

    try {
      // 验证密码确认
      if (req.password !== req.confirmPassword) {
        this.ctx.status = 400;
        throw new HttpException(400);
      }

      // 读取用户数据文件
      const userStorePath = path.join(__dirname, '../../store/user.store.json');
      const userData = JSON.parse(fs.readFileSync(userStorePath, 'utf8'));

      // 检查用户名是否已存在
      const existingUser = userData.users.find((u: any) => u.username === req.username);
      if (existingUser) {
        this.ctx.status = 409;
        throw new HttpException(409);
      }

      // 生成新用户ID
      const newUserId = `user_${Date.now()}`;

      // 加密密码
      const hashedPassword = CryptoJS.MD5(req.password).toString();

      // 创建新用户（使用默认头像）
      const newUser = {
        userId: newUserId,
        username: req.username,
        password: hashedPassword,
        avatar: '/avatar/default.png',
      };

      // 添加到用户数据
      userData.users.push(newUser);

      // 写回文件
      fs.writeFileSync(userStorePath, JSON.stringify(userData, null, 2));

      // 自动登录新用户
      this.ctx.session.user = {
        username: newUser.username,
        loginTime: new Date().toISOString(),
      };
      this.ctx.session.userId = newUser.userId;

      return {
        message: '注册成功',
        user: {
          userId: newUser.userId,
          username: newUser.username,
        },
      };
    } catch (error) {
      console.error('注册过程中发生错误:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      this.ctx.status = 500;
      throw new HttpException(500);
    }
  }

  @Api.Summary('User logout')
  @Post('/logout')
  @Contract(null, LoginResDTO)
  public async logout() {
    this.ctx.session.user = null;
    return {
      rows: [],
      message: 'Logout successful',
    };
  }

  @Api.Summary('获取用户会话信息')
  @Get('/getSession')
  @Contract(null, SessionResDTO)
  public getSession() {
    if (this.ctx.session.user) {
      return {
        data: this.ctx.session.user,
      };
    } else {
      return {
        data: null,
      };
    }
  }

  @Api.Summary('上传用户头像')
  @Post('/upload')
  @Contract(null, UploadResDTO)
  public async uploadAvatar(): Promise<UploadResDTO> {
    return new Promise((resolve, reject) => {
      try {
        console.log('开始处理头像上传请求');
        console.log('Session user:', this.ctx.session.user);

        // 检查用户是否已登录
        if (!this.ctx.session.user) {
          console.log('用户未登录，返回401错误');
          this.ctx.status = 401;
          reject(new HttpException(401));
          return;
        }

        console.log('用户已登录，检查请求类型');
        const contentType = this.ctx.request.headers['content-type'] || '';
        console.log('Content-Type:', contentType);

        // 处理直接二进制文件上传 (Content-Type: image/*)
        if (contentType.startsWith('image/')) {
          console.log('检测到直接二进制图片上传');
          this.handleBinaryUpload(contentType, resolve, reject);
          return;
        }

        // 处理multipart/form-data格式上传
        console.log('使用multer处理multipart/form-data上传');

        // 使用multer处理文件上传
        upload.single('avatar')(this.ctx.req as any, this.ctx.res as any, async (err: any) => {
          try {
            if (err) {
              console.error('Multer文件上传错误:', err);
              console.error('错误类型:', err.code);
              console.error('错误消息:', err.message);
              this.ctx.status = 400;
              reject(new HttpException(400));
              return;
            }

            console.log('Multer处理完成，检查文件');

            // 检查是否有文件上传
            const file = (this.ctx.req as any).file;
            console.log('上传的文件信息:', file);

            if (!file) {
              console.log('没有找到上传的文件，返回400错误');
              console.log('请求体信息:', this.ctx.request.body);
              console.log('请求头信息:', this.ctx.request.headers);
              this.ctx.status = 400;
              reject(new HttpException(400));
              return;
            }

            console.log('文件上传成功:', file.filename);
            const avatarPath = `/avatar/${file.filename}`;

            // 更新用户头像信息到数据库
            const userStorePath = path.join(__dirname, '../../store/user.store.json');
            const userData = JSON.parse(fs.readFileSync(userStorePath, 'utf8'));

            const user = userData.users.find((u: any) => u.username === this.ctx.session.user.username);
            if (user) {
              // 删除旧头像文件（如果不是默认头像）
              if (user.avatar && user.avatar !== '/avatar/default.png') {
                const oldAvatarPath = path.join(process.cwd(), 'public', user.avatar);
                if (fs.existsSync(oldAvatarPath)) {
                  fs.unlinkSync(oldAvatarPath);
                }
              }

              // 更新头像路径
              user.avatar = avatarPath;
              fs.writeFileSync(userStorePath, JSON.stringify(userData, null, 2));
            }

            resolve({
              message: '头像上传成功',
              avatar: avatarPath,
            });
          } catch (error) {
            console.error('处理上传文件时发生错误:', error);
            this.ctx.status = 500;
            reject(new HttpException(500));
          }
        });
      } catch (error) {
        console.error('上传头像过程中发生错误:', error);
        this.ctx.status = 500;
        reject(new HttpException(500));
      }
    });
  }

  /**
   * 处理直接二进制文件上传
   */
  private handleBinaryUpload(contentType: string, resolve: Function, reject: Function): void {
    console.log('处理直接二进制文件上传');

    // 获取文件扩展名
    const mimeToExt: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp'
    };

    const extension = mimeToExt[contentType] || 'jpg';
    console.log('文件扩展名:', extension);

    // 读取请求体中的二进制数据
    const chunks: any[] = [];

    this.ctx.req.on('data', (chunk: any) => {
      chunks.push(chunk);
    });

    this.ctx.req.on('end', async () => {
      try {
        const fileBuffer = Buffer.concat(chunks);
        console.log('读取到文件数据，大小:', fileBuffer.length, 'bytes');

        // 检查文件大小 (5MB)
        if (fileBuffer.length > 5 * 1024 * 1024) {
          console.log('文件太大，超过5MB限制');
          this.ctx.status = 400;
          reject(new HttpException(400));
          return;
        }

        if (fileBuffer.length === 0) {
          console.log('文件数据为空');
          this.ctx.status = 400;
          reject(new HttpException(400));
          return;
        }

        // 生成文件名
        const filename = `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
        console.log('生成文件名:', filename);

        // 确保上传目录存在
        const uploadDir = path.join(process.cwd(), 'public/avatar');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // 保存文件
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, fileBuffer as any);
        console.log('文件保存成功:', filePath);

        const avatarPath = `/avatar/${filename}`;

        // 更新用户头像信息到数据库
        await this.updateUserAvatar(avatarPath);

        resolve({
          message: '头像上传成功',
          avatar: avatarPath
        });

      } catch (error) {
        console.error('处理二进制文件时发生错误:', error);
        this.ctx.status = 500;
        reject(new HttpException(500));
      }
    });

    this.ctx.req.on('error', (error: any) => {
      console.error('读取请求数据时发生错误:', error);
      this.ctx.status = 500;
      reject(new HttpException(500));
    });
  }  /**
   * 更新用户头像信息到数据库
   */
  private async updateUserAvatar(avatarPath: string): Promise<void> {
    console.log('更新用户头像到数据库:', avatarPath);

    const userStorePath = path.join(__dirname, '../../store/user.store.json');
    const userData = JSON.parse(fs.readFileSync(userStorePath, 'utf8'));

    const user = userData.users.find((u: any) => u.username === this.ctx.session.user.username);
    if (user) {
      // 删除旧头像文件（如果不是默认头像）
      if (user.avatar && user.avatar !== '/avatar/default.png') {
        const oldAvatarPath = path.join(process.cwd(), 'public', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
          console.log('删除旧头像文件:', oldAvatarPath);
        }
      }

      // 更新头像路径
      user.avatar = avatarPath;
      fs.writeFileSync(userStorePath, JSON.stringify(userData, null, 2));
      console.log('用户头像信息更新成功');
    }
  }
}
