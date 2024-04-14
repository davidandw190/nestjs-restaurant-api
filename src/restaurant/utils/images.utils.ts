import { S3 } from 'aws-sdk';

export default class ImagesUtils {
  /**
   * Uploads images to an AWS S3 bucket.
   * @param {Array} uploadedFiles - An array of image files to be uploaded.
   * @returns {Promise<Array>} A promise that resolves to an array of upload response objects.
   */
  static async upload(
    uploadedFiles: Array<Express.Multer.File>,
  ): Promise<S3.ManagedUpload.SendData[]> {
    const s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    });

    const uploadPromises = uploadedFiles.map(async (file) => {
      const splitFile = file.originalname.split('.');
      const fileStamp = Date.now();
      const fileName = `${splitFile[0]}_${fileStamp}.${splitFile[1]}`;

      const params = {
        Bucket: `${process.env.AWS_S3_BUCKET_NAME}/restaurants`,
        Key: fileName,
        Body: file.buffer,
      };

      try {
        const uploadResponse = await s3.upload(params).promise();
        return uploadResponse;
      } catch (error) {
        console.error(`Error uploading file ${fileName}:`, error);
        throw new Error(`Failed to upload file ${fileName}: ${error.message}`);
      }
    });

    try {
      const images = await Promise.all(uploadPromises);
      return images;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw new Error('Failed to upload images: ' + error.message);
    }
  }

  static async delete(images): Promise<boolean> {
    const s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_KEY || '',
    });

    const imagesKeys = images.map((image) => {
      return { Key: image.Key };
    });

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME || '',
      Delete: {
        Objects: imagesKeys,
        Quiet: false,
      },
    };

    try {
      const data = await s3.deleteObjects(params).promise();
      console.log('Images deleted successfully:', data);
      return true;
    } catch (error) {
      console.error('Error deleting images:', error);
      throw new Error('Failed to delete images: ' + error.message);
    }
  }
}
