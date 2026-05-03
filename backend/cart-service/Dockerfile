# Build stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /build
COPY logging-common/pom.xml logging-common/pom.xml
COPY logging-common/src logging-common/src
RUN mvn -q -f logging-common/pom.xml install -DskipTests
COPY cart-service/pom.xml cart-service/pom.xml
COPY cart-service/src cart-service/src
RUN mvn -q -f cart-service/pom.xml clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /build/cart-service/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
