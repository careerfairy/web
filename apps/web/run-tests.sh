
#docker run -p 9323:9323 -v $(pwd)/apps/web/:/app/apps/web -it --entrypoint "" -e DEBUG=pw:webserver tests \
#  npm run test:e2e-webapp -w @careerfairy/webapp -- --project=firefox apps/web/tests/e2e/pages/livestream-registration.spec.ts

docker run -p 9323:9323 -p 8080:8080 -v $(pwd)/apps/web/:/app/apps/web -it --entrypoint "" -e DEBUG=pw:webserver tests \
  npm run test:e2e-webapp -w @careerfairy/webapp -- -g "Streamer hand raise functionality"

#docker run -p 9323:9323 -v $(pwd)/apps/web/:/app/apps/web -it --entrypoint "" -e DEBUG=pw:webserver tests \
#  npm run test:e2e-webapp -w @careerfairy/webapp -- --project=firefox