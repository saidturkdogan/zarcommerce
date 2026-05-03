# Build stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /build
COPY logging-common/pom.xml logging-common/pom.xml
COPY logging-common/src logging-common/src
RUN mvn -q -f logging-common/pom.xml install -DskipTests
COPY order-service/pom.xml order-service/pom.xml
COPY order-service/src order-service/src
RUN mvn -q -f order-service/pom.xml clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /build/order-service/target/*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]
