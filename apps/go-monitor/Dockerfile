FROM golang:1.20-alpine AS builder

WORKDIR /app
COPY go.mod ./
RUN go mod download

COPY . ./
RUN go build -o /app/go-monitor

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/go-monitor .

ENV PORT=8080
EXPOSE 8080

CMD ["./go-monitor"]

