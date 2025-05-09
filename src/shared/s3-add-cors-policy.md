this.s3.putBucketCors({
Bucket: envConfig.S3_BUCKET_NAME,
CORSConfiguration: {
CORSRules: [
{
AllowedHeaders: ['*'],
AllowedMethods: ['GET', 'PUT'],
AllowedOrigins: ['*'],
ExposeHeaders: [],
},
],
},
})
this.s3.putBucketPolicy({
Bucket: envConfig.S3_BUCKET_NAME,
Policy: JSON.stringify({
Version: '2012-10-17',
Statement: [
{
Sid: 'AllowAccess',
Effect: 'Allow',
Principal: '*',
Action: 's3:GetObject',
Resource: `arn:aws:s3:::${envConfig.S3_BUCKET_NAME}/*`,
},
],
}),
})

    	this.s3
    		.getBucketCors({
    			Bucket: envConfig.S3_BUCKET_NAME,
    		})
    		.then(console.log)
