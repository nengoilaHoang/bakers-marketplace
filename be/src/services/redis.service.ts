import redisClient from '#/redis.js';

class RedisService {
	public async set(
		key: string,
		value: unknown,
		ttlSeconds?: number,
	): Promise<void> {
		const serializedValue = JSON.stringify(value);

		if (serializedValue === undefined) {
			throw new TypeError('Redis value must be JSON serializable');
		}

		if (ttlSeconds !== undefined) {
			if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
				throw new RangeError('Redis TTL must be a positive integer');
			}

			await redisClient.set(key, serializedValue, { EX: ttlSeconds });
			return;
		}

		await redisClient.set(key, serializedValue);
	}

	public async get<T>(key: string): Promise<T | null> {
		const value = await redisClient.get(key);

		if (value === null) {
			return null;
		}

		return JSON.parse(value) as T;
	}

	public async delete(key: string): Promise<boolean> {
		return (await redisClient.del(key)) > 0;
	}

	public async exist(key: string): Promise<boolean> {
		return (await redisClient.exists(key)) > 0;
	}
}

export default new RedisService();
