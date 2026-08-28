import ky, { HTTPError, type Options } from 'ky'
import { env } from '../env.js';

type MyFetchProps = {
  path: string,
  channelId: string
  options?: Options
}

type Success<T> = {
  data: T
  error: null
}

type Failure<E> = {
  data: null
  error: E
}

type Result<T, E = Error | HTTPError> = Success<T> | Failure<E>

export async function myFetch<T, E = Error>(
  props: MyFetchProps
): Promise<Result<T, E>> {

  const { path, options = {}, channelId = "" } = props;

  const urlToFetch = new URL(`/api/v1${path}`, env.MINTLY_API_URL)
  urlToFetch.searchParams.set("channelId", channelId)

  const url = urlToFetch.toString()

  try {
    const data = await ky(url, {
      ...options,
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${env.MINTLY_API_KEY}`,
        Accept: "application/json",
      }
    }).json<T>()

    return {
      data,
      error: null,
    }
  } catch (error) {

    if (error instanceof HTTPError) {
      return {
        data: null,
        error: error as E,
      }
    }

    return {
      data: null,
      error: error as E,
    }
  }
}
