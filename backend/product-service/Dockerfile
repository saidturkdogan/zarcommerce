# Build stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /build
COPY logging-common/pom.xml logging-common/pom.xml
COPY logging-common/src logging-common/src
RUN mvn -q -f logging-common/pom.xml install -DskipTests
COPY product-service/pom.xml product-service/pom.xml
COPY product-service/src product-service/src
RUN mvn -q -f product-service/pom.xml clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /build/product-service/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
