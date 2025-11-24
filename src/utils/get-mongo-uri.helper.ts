export function getMongoUri() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI should be set");
  }
  return uri;
}
