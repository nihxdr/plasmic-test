import * as React from "react";
import { PlasmicComponent } from "@plasmicapp/loader-nextjs";
import { GetStaticPaths, GetStaticProps } from "next";
import {
  ComponentRenderData,
  PlasmicRootProvider,
} from "@plasmicapp/loader-react";
import Error from "next/error";
import { PLASMIC } from "../init";

export default function PlasmicLoaderPage(props: {
  plasmicData?: ComponentRenderData
}) {
  const { plasmicData } = props;
  if (!plasmicData || plasmicData.entryCompMetas.length === 0) {
    return <Error statusCode={404} />;
  }
  return (
    <PlasmicRootProvider
      loader={PLASMIC}
      prefetchedData={plasmicData}
    >
      <PlasmicComponent component={plasmicData.entryCompMetas[0].name} />
    </PlasmicRootProvider>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { plasmicLoaderPage } = context.params ?? {};
  const plasmicPath = typeof plasmicLoaderPage === 'string' ? plasmicLoaderPage : Array.isArray(plasmicLoaderPage) ? `/${plasmicLoaderPage.join('/')}` : '/';
  const plasmicData = await PLASMIC.maybeFetchComponentData(plasmicPath);
  if (plasmicData) {
    return {
      props: { plasmicData },
    };
  }
  return {
    // non-Plasmic catch-all
    props: {},
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const pageModules = await PLASMIC.fetchPages();
  return {
    paths: pageModules.map((mod) => ({
      params: {
        plasmicLoaderPage: mod.path.substring(1).split("/"),
      },
    })),
    fallback: false,
  };
}