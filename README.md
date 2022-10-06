# Zerologin, a passwordless authentication server

Public instance: [zerologin.co](https://zerologin.co)

Documentations are available on [docs.zerologin.co](https://docs.zerologin.co)

For more informations or support, join the dedicated telegram group [t.me/zerologin](https://t.me/zerologin) or DM on twitter [@zerologin_co](https://twitter.com/zerologin_co)


## Running with Docker and docker-compose

To run the setup with Docker, first first an image has to be build:

```shell
$ docker build -t [tag] .
```

Make sure to set the image name to the tag name given in the step above in `docker-compose.yml`:

```yml
...

    zerologin:
        image: [tag]
...
```

Now, the containerized setup can be run with docker-compose:

```shell
$ docker-compose create
$ docker-compose up
```