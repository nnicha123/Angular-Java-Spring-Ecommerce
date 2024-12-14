package com.luv2code.ecommerce.config;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import com.luv2code.ecommerce.entity.Product;
import com.luv2code.ecommerce.entity.ProductCategory;

import jakarta.persistence.EntityManager;
import jakarta.persistence.metamodel.EntityType;

@Configuration
public class MyDataRestConfig implements RepositoryRestConfigurer {
	
	private EntityManager entityManager;
	
	@Autowired
	public MyDataRestConfig(EntityManager theEntityManager) {
		entityManager = theEntityManager;
	}

	@Override
	public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
		// Make it read only by disabling put, post and delete
		HttpMethod[] theUnsupportedActions = {HttpMethod.PUT, HttpMethod.POST, HttpMethod.DELETE};
		
//		Disable HTTP methods for Product: PUT, POST and DELETE for Product
		config.getExposureConfiguration()
		.forDomainType(Product.class)
		.withItemExposure((metadata, httpMethods) -> httpMethods.disable(theUnsupportedActions))
		.withCollectionExposure((metadata, httpMethods) -> httpMethods.disable(theUnsupportedActions));
	
	
//	Disable HTTP methods for Product: PUT, POST and DELETE for ProductCategory
		config.getExposureConfiguration()
		.forDomainType(ProductCategory.class)
		.withItemExposure((metadata, httpMethods) -> httpMethods.disable(theUnsupportedActions))
		.withCollectionExposure((metadata, httpMethods) -> httpMethods.disable(theUnsupportedActions));

//		call an internal helper method
		exposeIds(config);
		
	}
	
	private void exposeIds(RepositoryRestConfiguration config) {
		Set<EntityType<?>> entities = entityManager.getMetamodel().getEntities();
		List<Class> entityClasses = new ArrayList<>();
		
		for(EntityType entityType: entities) {
			entityClasses.add(entityType.getJavaType());
		}
		
//		expose the entity ids for the array of the entity/domain types
		Class[] domainTypes = entityClasses.toArray(new Class[0]);
		config.exposeIdsFor(domainTypes);
		
	}
}
