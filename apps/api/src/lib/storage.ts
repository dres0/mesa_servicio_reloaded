import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob'

const isMock = process.env.MOCK_MODE === 'true'

function getClient(): BlobServiceClient {
  const account = process.env.BLOB_ACCOUNT_NAME!
  const key = process.env.BLOB_ACCOUNT_KEY!
  const credential = new StorageSharedKeyCredential(account, key)
  return new BlobServiceClient(`https://${account}.blob.core.windows.net`, credential)
}

export async function uploadFile(
  caseId: string,
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (isMock) {
    // En modo mock retornamos una URL falsa
    return `https://mock-storage.blob.core.windows.net/adjuntos-casos/${caseId}/${filename}?sv=mock`
  }

  const client = getClient()
  const container = client.getContainerClient(process.env.BLOB_CONTAINER_NAME!)
  const blobName = `${caseId}/${Date.now()}-${filename}`
  const blockBlob = container.getBlockBlobClient(blobName)

  await blockBlob.upload(buffer, buffer.length, {
    blobHTTPHeaders: { blobContentType: contentType },
  })

  return blobName
}

export function generateSasUri(blobName: string, expiryMinutes = 15): string {
  if (isMock) {
    return `https://mock-storage.blob.core.windows.net/adjuntos-casos/${blobName}?sv=mock&exp=${expiryMinutes}m`
  }

  const account = process.env.BLOB_ACCOUNT_NAME!
  const key = process.env.BLOB_ACCOUNT_KEY!
  const container = process.env.BLOB_CONTAINER_NAME!

  const credential = new StorageSharedKeyCredential(account, key)
  const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000)

  const sas = generateBlobSASQueryParameters(
    {
      containerName: container,
      blobName,
      permissions: BlobSASPermissions.parse('r'),
      expiresOn: expiry,
    },
    credential
  ).toString()

  return `https://${account}.blob.core.windows.net/${container}/${blobName}?${sas}`
}
