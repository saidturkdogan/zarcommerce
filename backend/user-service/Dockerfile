# Build stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /build
COPY logging-common/pom.xml logging-common/pom.xml
COPY logging-common/src logging-common/src
RUN mvn -q -f logging-common/pom.xml install -DskipTests
COPY user-service/pom.xml user-service/pom.xml
COPY user-service/src user-service/src
RUN mvn -q -f user-service/pom.xml clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /build/user-service/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
