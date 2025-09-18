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
import Database from '@server/lib/database';

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
      // 从数据库查找用户
      const users = await Database.query(
        'SELECT * FROM users WHERE username = ?',
        [req.username]
      );

      const user = users[0];
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

      // 登录成功，设置会话
      this.ctx.session.user = {
        username: user.username,
        loginTime: new Date().toISOString(),
      };
      this.ctx.session.userId = user.user_id;

      return {
        success: true,
        rows: [],
        message: 'Login successful',
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

      // 检查用户名是否已存在
      const existingUsers = await Database.query(
        'SELECT * FROM users WHERE username = ?',
        [req.username]
      );

      if (existingUsers.length > 0) {
        this.ctx.status = 409;
        throw new HttpException(409);
      }

      // 生成新用户ID
      const newUserId = `user_${Date.now()}`;

      // 加密密码
      const hashedPassword = CryptoJS.MD5(req.password).toString();

      // 插入新用户到数据库
      await Database.query(
        'INSERT INTO users (user_id, username, password, avatar) VALUES (?, ?, ?, ?)',
        [newUserId, req.username, hashedPassword, '/avatar/default.png']
      );

      // 自动登录新用户
      this.ctx.session.user = {
        username: req.username,
        loginTime: new Date().toISOString(),
      };
      this.ctx.session.userId = newUserId;

      return {
        success: true,
        message: '注册成功',
        user: {
          userId: newUserId,
          username: req.username,
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
      success: true,
      rows: [],
      message: 'Logout successful',
    };
  }

  @Api.Summary('获取用户会话信息')
  @Get('/getSession')
  @Contract(null, SessionResDTO)
  public async getSession() {
    if (this.ctx.session.user) {
      try {
        // 从数据库获取完整的用户信息，包括头像
        const users = await Database.query(
          'SELECT * FROM users WHERE username = ?',
          [this.ctx.session.user.username]
        );

        const user = users[0];
        if (user) {
          return {
            success: true,
            data: {
              userId: user.user_id,
              username: user.username,
              avatar: user.avatar || null,
            },
          };
        } else {
          return {
            success: false,
            message: '用户不存在',
            data: null,
          };
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        return {
          success: false,
          message: '获取用户信息失败',
          data: null,
        };
      }
    } else {
      return {
        success: false,
        message: '未登录',
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

        // 只支持直接二进制文件上传 (Content-Type: image/*)
        if (contentType.startsWith('image/')) {
          console.log('检测到直接二进制图片上传');
          this.handleBinaryUpload(contentType, resolve, reject);
          return;
        }

        // 不支持的上传格式
        console.log('不支持的上传格式，只支持直接二进制图片上传');
        this.ctx.status = 400;
        reject(new HttpException(400));

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
          success: true,
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
  }

  /**
   * 更新用户头像信息到数据库
   */
  private async updateUserAvatar(avatarPath: string): Promise<void> {
    console.log('更新用户头像到数据库:', avatarPath);

    try {
      // 获取用户当前头像
      const users = await Database.query(
        'SELECT avatar FROM users WHERE username = ?',
        [this.ctx.session.user.username]
      );

      const user = users[0];
      if (user && user.avatar && user.avatar !== '/avatar/default.png') {
        // 删除旧头像文件
        const oldAvatarPath = path.join(process.cwd(), 'public', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
          console.log('删除旧头像文件:', oldAvatarPath);
        }
      }

      // 更新头像路径到数据库
      await Database.query(
        'UPDATE users SET avatar = ? WHERE username = ?',
        [avatarPath, this.ctx.session.user.username]
      );

      console.log('用户头像信息更新成功');
    } catch (error) {
      console.error('更新用户头像失败:', error);
      throw error;
    }
  }
}
