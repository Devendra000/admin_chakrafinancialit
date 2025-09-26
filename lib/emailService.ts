import nodemailer from 'nodemailer';

// Email service configuration
interface EmailConfig {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

interface BlogEmailData {
  title: string;
  excerpt: string;
  author: string;
  category: string;
  publishedAt: string;
  blogUrl: string;
  featuredImage?: string;
  tags: string[];
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    // You can use Gmail, Outlook, SendGrid, or any SMTP service
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this to your preferred email service
      auth: {
        user: process.env.EMAIL_USER || '', // Your email address
        pass: process.env.EMAIL_PASS || '', // Your app password (for Gmail)
      },
    });

    // Alternative configuration for custom SMTP
    // this.transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST || 'smtp.gmail.com',
    //   port: parseInt(process.env.SMTP_PORT || '587'),
    //   secure: false, // true for 465, false for other ports
    //   auth: {
    //     user: process.env.EMAIL_USER || '',
    //     pass: process.env.EMAIL_PASS || '',
    //   },
    // });
  }

  async sendEmail(config: EmailConfig): Promise<boolean> {
    try {
      const mailOptions = {
        from: {
          name: 'Chakra Financial and IT Solutions',
          address: process.env.EMAIL_USER || 'dev20581114@gmail.com'
        },
        to: config.to,
        subject: config.subject,
        html: config.html,
        text: config.text || this.stripHtml(config.html),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Generate HTML template for new blog notification
  generateBlogNotificationHTML(blogData: BlogEmailData): string {
    const {
      title,
      excerpt,
      author,
      category,
      publishedAt,
      blogUrl,
      featuredImage,
      tags
    } = blogData;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Blog Post - ${title}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background-color: #f8f9fa;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #000000 0%, #333333 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 32px;
            font-weight: bold;
        }
        .header .subtitle {
            color: #ff6b35;
            margin: 10px 0 0 0;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .featured-image {
            width: 100%;
            height: 250px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .blog-title {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
            line-height: 1.3;
        }
        .blog-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
        }
        .meta-item {
            background-color: #f8f9fa;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            color: #666;
            border: 1px solid #e9ecef;
        }
        .category {
            background-color: #ff6b35;
            color: white;
            font-weight: bold;
        }
        .excerpt {
            font-size: 18px;
            line-height: 1.6;
            color: #555;
            margin-bottom: 30px;
        }
        .tags {
            margin-bottom: 30px;
        }
        .tag {
            display: inline-block;
            background-color: #e9ecef;
            color: #666;
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 12px;
            margin: 0 8px 8px 0;
        }
        .cta-button {
            background: linear-gradient(135deg, #ff6b35 0%, #f0511e 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 18px;
            display: inline-block;
            transition: transform 0.3s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 0;
            color: #666;
            font-size: 14px;
        }
        .unsubscribe {
            margin-top: 15px;
        }
        .unsubscribe a {
            color: #666;
            text-decoration: underline;
            font-size: 12px;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .content, .header, .footer {
                padding: 20px;
            }
            .blog-title {
                font-size: 24px;
            }
            .blog-meta {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Blog Post</h1>
            <p class="subtitle">Chakra Financial and IT Solutions</p>
        </div>
        
        <div class="content">
            ${featuredImage ? `<img src="${featuredImage}" alt="${title}" class="featured-image" />` : ''}
            
            <h2 class="blog-title">${title}</h2>
            
            <div class="blog-meta">
                <div class="meta-item category">${category}</div>
                <div class="meta-item">By ${author}</div>
                <div class="meta-item">${publishedAt}</div>
            </div>
            
            <p class="excerpt">${excerpt}</p>
            
            ${tags.length > 0 ? `
            <div class="tags">
                ${tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 40px;">
                <a href="${blogUrl}" class="cta-button">Read Full Article</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Chakra Financial and IT Solutions</strong></p>
            <p>Expert insights, industry trends, and thought leadership in finance and technology</p>
            <div class="unsubscribe">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/unsubscribe">Unsubscribe from our newsletter</a>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  // Generate plain text version
  generateBlogNotificationText(blogData: BlogEmailData): string {
    const {
      title,
      excerpt,
      author,
      category,
      publishedAt,
      blogUrl,
      tags
    } = blogData;

    return `
New Blog Post: ${title}

Category: ${category}
Author: ${author}
Published: ${publishedAt}

${excerpt}

${tags.length > 0 ? `Tags: ${tags.map(tag => '#' + tag).join(', ')}` : ''}

Read the full article: ${blogUrl}

---
Chakra Financial and IT Solutions
Expert insights, industry trends, and thought leadership in finance and technology

Unsubscribe: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/unsubscribe
    `;
  }

  // Helper method to strip HTML tags for text version
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Send blog notification to all subscribers
  async sendBlogNotification(blogData: BlogEmailData, subscriberEmails: string[]): Promise<{ success: boolean; sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    // Send emails in batches to avoid overwhelming the email service
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < subscriberEmails.length; i += batchSize) {
      batches.push(subscriberEmails.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      try {
        const html = this.generateBlogNotificationHTML(blogData);
        const text = this.generateBlogNotificationText(blogData);

        const success = await this.sendEmail({
          to: batch,
          subject: `New Article: ${blogData.title}`,
          html,
          text
        });

        if (success) {
          sent += batch.length;
        } else {
          failed += batch.length;
        }

        // Add a small delay between batches to be respectful to email providers
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Error sending batch email:', error);
        failed += batch.length;
      }
    }

    return {
      success: sent > 0,
      sent,
      failed
    };
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

export default EmailService;
