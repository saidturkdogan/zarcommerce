# service-product is already downloaded, let's extract it
Expand-Archive -Path service-product.zip -DestinationPath service-product -Force
Remove-Item service-product.zip

# api-gateway
curl.exe -G https://start.spring.io/starter.zip -d dependencies=cloud-gateway,actuator -d type=maven-project -d groupId=com.zarcommerce -d artifactId=api-gateway -d name=api-gateway -d packaging=jar -d javaVersion=17 -o api-gateway.zip
Expand-Archive -Path api-gateway.zip -DestinationPath api-gateway -Force
Remove-Item api-gateway.zip

# service-user
curl.exe -G https://start.spring.io/starter.zip -d dependencies=web,data-jpa,postgresql,validation,lombok,security -d type=maven-project -d groupId=com.zarcommerce -d artifactId=service-user -d name=service-user -d packaging=jar -d javaVersion=17 -o service-user.zip
Expand-Archive -Path service-user.zip -DestinationPath service-user -Force
Remove-Item service-user.zip

# service-cart
curl.exe -G https://start.spring.io/starter.zip -d dependencies=web,data-jpa,postgresql,validation,lombok -d type=maven-project -d groupId=com.zarcommerce -d artifactId=service-cart -d name=service-cart -d packaging=jar -d javaVersion=17 -o service-cart.zip
Expand-Archive -Path service-cart.zip -DestinationPath service-cart -Force
Remove-Item service-cart.zip

# service-order
curl.exe -G https://start.spring.io/starter.zip -d dependencies=web,data-jpa,postgresql,validation,lombok,amqp -d type=maven-project -d groupId=com.zarcommerce -d artifactId=service-order -d name=service-order -d packaging=jar -d javaVersion=17 -o service-order.zip
Expand-Archive -Path service-order.zip -DestinationPath service-order -Force
Remove-Item service-order.zip

# service-recommendation
curl.exe -G https://start.spring.io/starter.zip -d dependencies=web,lombok -d type=maven-project -d groupId=com.zarcommerce -d artifactId=service-recommendation -d name=service-recommendation -d packaging=jar -d javaVersion=17 -o service-recommendation.zip
Expand-Archive -Path service-recommendation.zip -DestinationPath service-recommendation -Force
Remove-Item service-recommendation.zip

Write-Host "All Spring Boot projects have been initialized."
