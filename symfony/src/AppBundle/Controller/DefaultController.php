<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use AppBundle\Entity\Word;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\Response;

class DefaultController extends Controller
{
    public function indexAction(Request $request)
    {
        // replace this example code with whatever you need
        return $this->render('default/index.html.twig');
    }

    /**
     * @Route("/slide/{slide_id}", defaults={"slide_id" = null})
     */
    public function slideAction(Request $request, $slide_id)
    {
        $repository = $this->getDoctrine()->getRepository('AppBundle:Slide');

        if($slide_id) {
            $slide = $repository->findOneById($slide_id);
        } else {
            $slide = $repository->createQueryBuilder('p')->orderBy('p.id', 'DESC')->setMaxResults(1)->getQuery()->getOneOrNullResult();
        }

        if(!$slide) {
            throw $this->createNotFoundException('The slide does not exist');
        }

        return new Response($slide->getContent());
    }

    /**
     * @Route("/addWord")
     * @Method({"POST"})
     */
    public function addWordAction(Request $request)
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $word_str = $data['word'];
        $serializer = new Serializer([new ObjectNormalizer()], [new JsonEncoder()]);

        $repository = $this->getDoctrine()->getRepository('AppBundle:Word');
        $word = $repository->findOneBy(
            ['word' => $word_str, 'user' => $user->getUsername()]
        );

        if(!$word) {
            $em = $this->getDoctrine()->getManager();

            $word = new Word;
            $word->setUser($this->getUser()->getUsername());
            $word->setWord($word_str);

            $errors = $this->get('validator')->validate($word);

            if(count($errors)) {
                return $this->json(json_decode($serializer->serialize($errors, 'json')))->setStatusCode(400);
            }

            $em->persist($word);

            $em->flush();
        }
        
        return $this->json(json_decode($serializer->serialize($word, 'json')));
    }

    /**
     * @Route("/getWord")
     * @Method({"GET"})
     */
    public function getWordAction(Request $request)
    {
        $user = $this->getUser();

        $word_str = $request->query->get('word');
        $serializer = new Serializer([new ObjectNormalizer()], [new JsonEncoder()]);

        $repository = $this->getDoctrine()->getRepository('AppBundle:Word');
        $word = $repository->findOneBy(
            ['word' => $word_str, 'user' => $user->getUsername()]
        );

        if(!$word) {
            return new Response(null);
        }
        
        return $this->json(json_decode($serializer->serialize($word, 'json')));
    }
}
