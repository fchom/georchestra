/*
 * Copyright (C) 2009-2016 by the geOrchestra PSC
 *
 * This file is part of geOrchestra.
 *
 * geOrchestra is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * geOrchestra is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * geOrchestra.  If not, see <http://www.gnu.org/licenses/>.
 */

package org.georchestra.mapfishapp.ws;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.apache.commons.lang.StringUtils;
import org.georchestra.mapfishapp.model.ConnectionPool;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;


/**
 * This service handles the storage and the loading of a wmc file on a temporary directory.
 *
 * @author yoann buch  - yoann.buch@gmail.com
 *
 */

public class WMCDocService extends A_DocService {

    public static final String FILE_EXTENSION = ".wmc";
    public static final String MIME_TYPE = "application/vnd.ogc.context+xml";
    public static final String SCHEMA_URL = "http://schemas.opengis.net/context/1.1.0/context.xsd";

    public WMCDocService(final String tempDir, ConnectionPool pgpool) {
        super(FILE_EXTENSION, MIME_TYPE, tempDir, pgpool);
    }

    /*=================================Overridden methods===============================================*/

    /**
     * Called before saving the content
     * @throws DocServiceException
     */
    @Override
    protected void preSave() throws DocServiceException {

        // check if wmc content is valid towards its xsd schema

        /* WMC file generated by OpenLayers seems to be not valid!
        isDocumentValid(SCHEMA_URL);
        */
    }

    /**
     * Called right after the loading of the file content
     * @throws DocServiceException
     */
    @Override
    protected void postLoad() throws DocServiceException {

        // get the real file name: the one that the user chose
        // it is hidden in the "id" attribute in the first node "ViewContext"
        String name = extractRealFileName(new ByteArrayInputStream(_content.getBytes()));
        if(name == null) {
            //could not extract file name in content, let it with default value
        }
        else {
            _name = name + FILE_EXTENSION;
        }

    }

    /*=======================================Private Methods=============================================*/

    /**
     * Get the real name of the file given by the user. It is hidden in the id attribute of the ViewContext Node
     * @param content
     * @return String real file name
     * @throws DocServiceException
     */
    private String extractRealFileName(final InputStream content) throws DocServiceException {

        String fileName = null;

        // create a document DOM from the content
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder;

        try {
            factory.setXIncludeAware(false);
            factory.setExpandEntityReferences(false);

            builder = factory.newDocumentBuilder();

            Document document = builder.parse(content);

            // get hidden file name
            NodeList nodes = document.getElementsByTagName("Title");
            if(nodes.getLength() > 0) {
                Node child = nodes.item(0);
                fileName = child.getTextContent();
            }
            if (StringUtils.isEmpty(fileName)) {
                // try to get internal id
                nodes = document.getElementsByTagName("ViewContext");
                if(nodes.getLength() == 1) {
                    Element el = (Element) nodes.item(0);
                    fileName = el.getAttribute("id");
                }
            }
        } catch (Exception e) {
            LOG.error("Error while trying to extract the filename from the provided XML document", e);
        }
        return fileName;
    }
}
